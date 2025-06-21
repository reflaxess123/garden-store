import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  logApiRequest,
  logError,
} from "../../../_utils/logger";

interface CategoryRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, context: CategoryRouteContext) {
  try {
    logApiRequest("PATCH", "/api/admin/categories/[id]");

    const { id } = await context.params;
    const body = await req.json();

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/categories/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Error updating category", null, {
        endpoint: `/admin/categories/${id}`,
        status: response.status,
        errorText,
        categoryId: id,
      });
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: response.status }
      );
    }

    const updatedCategory = await response.json();
    return NextResponse.json(updatedCategory);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/categories/[id]",
      method: "PATCH",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

export async function DELETE(req: NextRequest, context: CategoryRouteContext) {
  try {
    logApiRequest("DELETE", "/api/admin/categories/[id]");

    const { id } = await context.params;

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/categories/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Error deleting category", null, {
        endpoint: `/admin/categories/${id}`,
        status: response.status,
        errorText,
        categoryId: id,
      });
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/categories/[id]",
      method: "DELETE",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
