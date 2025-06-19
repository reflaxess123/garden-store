#!/usr/bin/env python3
"""
Скрипт для генерации TypeScript клиента и типов из OpenAPI схемы
"""
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Set
import re

def snake_to_camel(name: str) -> str:
    """Конвертирует snake_case в camelCase"""
    components = name.split('_')
    return components[0] + ''.join(x.capitalize() for x in components[1:])

def generate_typescript_types(schema: Dict[str, Any]) -> str:
    """Генерирует TypeScript типы из OpenAPI схемы"""
    components = schema.get('components', {})
    schemas = components.get('schemas', {})
    
    types_content = []
    types_content.append("// Автоматически сгенерированные типы из OpenAPI схемы")
    types_content.append("// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ")
    types_content.append("")
    
    # Генерируем интерфейсы для каждой схемы
    for schema_name, schema_def in schemas.items():
        if schema_def.get('type') == 'object':
            properties = schema_def.get('properties', {})
            required = schema_def.get('required', [])
            
            types_content.append(f"export interface {schema_name} {{")
            
            for prop_name, prop_def in properties.items():
                is_required = prop_name in required
                optional_mark = "" if is_required else "?"
                
                # Определяем тип TypeScript
                ts_type = get_typescript_type(prop_def)
                
                types_content.append(f"  {prop_name}{optional_mark}: {ts_type};")
            
            types_content.append("}")
            types_content.append("")
    
    return "\n".join(types_content)

def get_typescript_type(prop_def: Dict[str, Any]) -> str:
    """Конвертирует OpenAPI тип в TypeScript тип"""
    prop_type = prop_def.get('type')
    prop_format = prop_def.get('format')
    
    if prop_type == 'string':
        if prop_format == 'uuid':
            return 'string'
        elif prop_format == 'date-time':
            return 'string'
        else:
            return 'string'
    elif prop_type == 'integer':
        return 'number'
    elif prop_type == 'number':
        return 'number'
    elif prop_type == 'boolean':
        return 'boolean'
    elif prop_type == 'array':
        items = prop_def.get('items', {})
        item_type = get_typescript_type(items)
        return f'{item_type}[]'
    elif prop_type == 'object':
        return 'any'
    elif '$ref' in prop_def:
        # Извлекаем имя типа из ссылки
        ref = prop_def['$ref']
        type_name = ref.split('/')[-1]
        return type_name
    else:
        return 'any'

def generate_api_client(schema: Dict[str, Any]) -> str:
    """Генерирует API клиент для TanStack Query"""
    paths = schema.get('paths', {})
    
    client_content = []
    client_content.append("// Автоматически сгенерированный API клиент")
    client_content.append("// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ")
    client_content.append("")
    client_content.append("import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';")
    client_content.append("import type * as Types from './types';")
    client_content.append("")
    
    # Базовый конфиг для API
    client_content.append("const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';")
    client_content.append("")
    
    # Функция для выполнения HTTP запросов
    client_content.append("async function fetchApi<T>(")
    client_content.append("  endpoint: string,")
    client_content.append("  options: RequestInit = {}")
    client_content.append("): Promise<T> {")
    client_content.append("  const url = `${API_BASE_URL}${endpoint}`;")
    client_content.append("  ")
    client_content.append("  const response = await fetch(url, {")
    client_content.append("    credentials: 'include',")
    client_content.append("    headers: {")
    client_content.append("      'Content-Type': 'application/json',")
    client_content.append("      ...options.headers,")
    client_content.append("    },")
    client_content.append("    ...options,")
    client_content.append("  });")
    client_content.append("")
    client_content.append("  if (!response.ok) {")
    client_content.append("    throw new Error(`HTTP error! status: ${response.status}`);")
    client_content.append("  }")
    client_content.append("")
    client_content.append("  return response.json();")
    client_content.append("}")
    client_content.append("")
    
    # Генерируем функции для каждого эндпоинта
    for path, methods in paths.items():
        for method, details in methods.items():
            operation_id = details.get('operationId')
            if not operation_id:
                # Генерируем operationId из path и method
                clean_path = re.sub(r'[{}]', '', path).replace('/', '_').strip('_')
                operation_id = f"{method}_{clean_path}"
            
            # Генерируем функцию API
            generate_api_function(client_content, path, method, details, operation_id)
            
            # Генерируем React Query хуки
            if method.lower() == 'get':
                generate_query_hook(client_content, operation_id, details)
            else:
                generate_mutation_hook(client_content, operation_id, details)
    
    return "\n".join(client_content)

def generate_api_function(content: List[str], path: str, method: str, details: Dict[str, Any], operation_id: str):
    """Генерирует функцию для API вызова"""
    parameters = details.get('parameters', [])
    request_body = details.get('requestBody', {})
    
    # Параметры функции
    func_params = []
    url_params = []
    
    # Обрабатываем параметры пути
    path_params = [p for p in parameters if p.get('in') == 'path']
    query_params = [p for p in parameters if p.get('in') == 'query']
    
    for param in path_params:
        param_name = param['name']
        func_params.append(f"{param_name}: string")
        path = path.replace(f"{{{param_name}}}", f"${{{param_name}}}")
    
    # Добавляем query параметры
    if query_params:
        func_params.append("params?: { " + ", ".join([f"{p['name']}?: {get_param_type(p)}" for p in query_params]) + " }")
    
    # Добавляем body для POST/PUT запросов
    if request_body:
        body_schema = request_body.get('content', {}).get('application/json', {}).get('schema', {})
        body_type = get_response_type(body_schema)
        func_params.append(f"data: {body_type}")
    
    # Определяем тип возвращаемого значения
    responses = details.get('responses', {})
    success_response = responses.get('200') or responses.get('201') or responses.get('204')
    return_type = 'void'
    if success_response:
        response_schema = success_response.get('content', {}).get('application/json', {}).get('schema', {})
        return_type = get_response_type(response_schema)
    
    func_name = snake_to_camel(operation_id)
    
    content.append(f"// {details.get('summary', 'API function')}")
    content.append(f"export async function {func_name}(")
    if func_params:
        content.append("  " + ",\n  ".join(func_params))
    content.append(f"): Promise<{return_type}> {{")
    
    # Формируем URL
    content.append(f"  let url = `{path}`;")
    
    # Добавляем query параметры
    if query_params:
        content.append("  if (params) {")
        content.append("    const searchParams = new URLSearchParams();")
        for param in query_params:
            param_name = param['name']
            content.append(f"    if (params.{param_name} !== undefined) {{")
            content.append(f"      searchParams.append('{param_name}', String(params.{param_name}));")
            content.append("    }")
        content.append("    url += `?${searchParams.toString()}`;")
        content.append("  }")
    
    # Формируем опции запроса
    content.append("  const options: RequestInit = {")
    content.append(f"    method: '{method.upper()}',")
    if request_body:
        content.append("    body: JSON.stringify(data),")
    content.append("  };")
    
    content.append(f"  return fetchApi<{return_type}>(url, options);")
    content.append("}")
    content.append("")

def generate_query_hook(content: List[str], operation_id: str, details: Dict[str, Any]):
    """Генерирует React Query хук для GET запросов"""
    func_name = snake_to_camel(operation_id)
    hook_name = f"use{func_name.capitalize()}"
    
    content.append(f"// React Query хук для {func_name}")
    content.append(f"export function {hook_name}(")
    
    # Определяем параметры хука
    parameters = details.get('parameters', [])
    path_params = [p for p in parameters if p.get('in') == 'path']
    query_params = [p for p in parameters if p.get('in') == 'query']
    
    hook_params = []
    if path_params:
        for param in path_params:
            hook_params.append(f"{param['name']}: string")
    
    if query_params:
        hook_params.append("params?: { " + ", ".join([f"{p['name']}?: {get_param_type(p)}" for p in query_params]) + " }")
    
    hook_params.append("options?: { enabled?: boolean }")
    
    if hook_params:
        content.append("  " + ",\n  ".join(hook_params))
    
    content.append(") {")
    
    # Формируем query key
    query_key_parts = [f"'{func_name}'"]
    for param in path_params:
        query_key_parts.append(param['name'])
    if query_params:
        query_key_parts.append("params")
    
    content.append(f"  return useQuery({{")
    content.append(f"    queryKey: [{', '.join(query_key_parts)}],")
    
    # Формируем queryFn
    query_fn_params = []
    for param in path_params:
        query_fn_params.append(param['name'])
    if query_params:
        query_fn_params.append("params")
    
    if query_fn_params:
        content.append(f"    queryFn: () => {func_name}({', '.join(query_fn_params)}),")
    else:
        content.append(f"    queryFn: {func_name},")
    
    content.append("    ...options,")
    content.append("  });")
    content.append("}")
    content.append("")

def generate_mutation_hook(content: List[str], operation_id: str, details: Dict[str, Any]):
    """Генерирует React Query хук для мутаций (POST, PUT, DELETE)"""
    func_name = snake_to_camel(operation_id)
    hook_name = f"use{func_name.capitalize()}"
    
    content.append(f"// React Query мутация для {func_name}")
    content.append(f"export function {hook_name}() {{")
    content.append("  const queryClient = useQueryClient();")
    content.append("  ")
    content.append("  return useMutation({")
    content.append(f"    mutationFn: {func_name},")
    content.append("    onSuccess: () => {")
    content.append("      // Инвалидируем связанные запросы")
    content.append("      queryClient.invalidateQueries();")
    content.append("    },")
    content.append("  });")
    content.append("}")
    content.append("")

def get_param_type(param: Dict[str, Any]) -> str:
    """Определяет TypeScript тип параметра"""
    schema = param.get('schema', {})
    return get_typescript_type(schema)

def get_response_type(schema: Dict[str, Any]) -> str:
    """Определяет TypeScript тип ответа"""
    if not schema:
        return 'void'
    
    if '$ref' in schema:
        ref = schema['$ref']
        return ref.split('/')[-1]
    
    return get_typescript_type(schema)

def generate_client_files():
    """Генерирует файлы клиента для фронта"""
    # Читаем OpenAPI схему
    schema_file = Path(__file__).parent / "openapi.json"
    
    if not schema_file.exists():
        print("Файл openapi.json не найден. Сначала запустите generate_openapi.py")
        return False
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    
    # Путь к фронту
    front_dir = Path(__file__).parent.parent / "front"
    api_dir = front_dir / "src" / "shared" / "api" / "generated"
    
    # Создаём директорию если её нет
    api_dir.mkdir(parents=True, exist_ok=True)
    
    # Генерируем типы
    types_content = generate_typescript_types(schema)
    types_file = api_dir / "types.ts"
    
    with open(types_file, 'w', encoding='utf-8') as f:
        f.write(types_content)
    
    print(f"TypeScript типы сгенерированы: {types_file}")
    
    # Генерируем API клиент
    client_content = generate_api_client(schema)
    client_file = api_dir / "api-client.ts"
    
    with open(client_file, 'w', encoding='utf-8') as f:
        f.write(client_content)
    
    print(f"API клиент сгенерирован: {client_file}")
    
    # Создаём index файл для удобного импорта
    index_content = [
        "// Автоматически сгенерированный индекс",
        "export * from './types';",
        "export * from './api-client';",
    ]
    
    index_file = api_dir / "index.ts"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(index_content))
    
    print(f"Индекс файл создан: {index_file}")
    print(f"\nВсе файлы сгенерированы в: {api_dir}")
    
    return True

if __name__ == "__main__":
    generate_client_files() 