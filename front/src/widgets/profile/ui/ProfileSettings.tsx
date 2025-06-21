import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

export function ProfileSettings() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Уведомления по email</h3>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о статусе заказов
              </p>
            </div>
            <Button variant="outline" size="sm">
              Настроить
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Изменить пароль</h3>
              <p className="text-sm text-muted-foreground">
                Обновить пароль для входа в аккаунт
              </p>
            </div>
            <Button variant="outline" size="sm">
              Изменить
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
            <div>
              <h3 className="font-medium text-destructive">Удалить аккаунт</h3>
              <p className="text-sm text-muted-foreground">
                Полностью удалить аккаунт и все данные
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
