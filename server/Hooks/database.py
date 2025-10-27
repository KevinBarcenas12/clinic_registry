import psycopg2
from typing import Any
from .functions import Response
from .. import Classes, Hooks

def connection_starter():
    return psycopg2.connect(
        user = 'postgres',
        password = 'admin',
        database = 'main',
        host = '127.0.0.1',
        port = '5432'
    )

handler = connection_starter()

def get_cursor():
    return handler.cursor()

def fetchall(query: str, cursor: psycopg2.extensions.cursor | None = None, close: bool = True) -> Classes.Aux.Response[list[Any] | str]:
    try:
        if not query:
            return Response(success=False, details="SQL Query invalid or missing.")

        if not cursor:
            cursor = handler.cursor()
            close = True

        cursor.execute(query)
        details = cursor.fetchall()

        if not details:
            return Response(success=False, details="No data found.")

        if close:
            cursor.close()

        return Response(success=True, details=details)
    except Exception as e:
        Hooks.logger(f'An error ocurred: {e.__cause__ if e.__cause__ else e}')
        return Response(success=False, details=f'An error ocurred: {e.__cause__ if e.__cause__ else e}')

def fetchone(query: str, cursor: psycopg2.extensions.cursor | None = None, close: bool = True) -> Classes.Aux.Response[Any | str]:
    try:
        if not query:
            return Response(success=False, details="SQL Query invalid or missing.")

        if not cursor:
            cursor = handler.cursor()

        cursor.execute(query)
        details = cursor.fetchone()

        if not details:
            return Response(success=False, details="No data found.")

        if close:
            cursor.close()
        return Response(success=True, details=details)
    except Exception as e:
        Hooks.logger(f'An error ocurred: {e.__cause__ if e.__cause__ else e}')
        return Response(success=False, details=f'An error ocurred: {e.__cause__ if e.__cause__ else e}')

def commit(query: str, cursor: psycopg2.extensions.cursor | None = None, close: bool = True) -> Classes.Aux.Response[str]:
    try:
        if not query:
            return Response(success=False, details="SQL Query invalid or missing.")

        if not cursor:
            cursor = handler.cursor()

        cursor.execute(query)
        handler.commit()

        if close:
            cursor.close()

        return Response(success=True, details="The query was executed successfully.")

    except Exception as e:
        handler.rollback()
        Hooks.logger(f'An error ocurred: {e.__cause__ if e.__cause__ else e}')
        return Response(success=False, details=f'An error ocurred: {e.__cause__ if e.__cause__ else e}')
