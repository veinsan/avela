import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str, retryable: bool = False):
        self.status, self.code, self.message, self.retryable = status, code, message, retryable


def not_found() -> ApiError:
    # Same answer for "missing" and "not yours" so resource existence is not leaked.
    return ApiError(404, "NOT_FOUND", "Resource not found.")


def conflict() -> ApiError:
    return ApiError(409, "VERSION_CONFLICT", "The resource changed or is not in a valid state for this action.")


def _body(request: Request, code: str, message: str, retryable: bool) -> dict:
    return {"error": {"code": code, "message": message,
                      "requestId": request.headers.get("x-request-id") or str(uuid.uuid4()),
                      "retryable": retryable}}


def install(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error(request: Request, exc: ApiError):
        return JSONResponse(_body(request, exc.code, exc.message, exc.retryable), status_code=exc.status)

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError):
        fields = sorted({".".join(str(p) for p in e["loc"][1:]) for e in exc.errors()})
        return JSONResponse(_body(request, "VALIDATION_FAILED", "Invalid fields: " + ", ".join(fields), False),
                            status_code=422)
