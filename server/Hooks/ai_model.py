from openai import OpenAI
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
from typing import Iterable
from .. import Hooks

class Response(BaseModel):
    message: str

class Model:
    # OpenAI Public API Model
    # __MODEL = 'gpt-4.1'
    # Localhost OpenAI API Model
    # __MODEL = 'meta-llama-3.1-8b-instruct'
    # __MODEL = 'google/gemma-3-12b'
    __MODEL = 'llama-3-8b-instruct-64k'
    def __init__(self):
        # OpenAI Public API
        # 
        # Localhost OpenAI API
        self.model = OpenAI(base_url='http://127.0.0.1:1234/v1', api_key='lm-studio')

    def message(self, messages: Iterable[ChatCompletionMessageParam], force_plain_reply = False, force_reply_with_links = False):
        return self.model.chat.completions.create(
            model=self.__MODEL,
            messages=messages,
            tools=[
                {
                    "type": "function",
                    "function": {
                        "name": "plain_response",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "response_message": {
                                    "type": "string",
                                    "description": "A response message back to the user.",
                                },
                            },
                            "required": [
                                "response_message",
                            ],
                        },
                    },
                },
            ] if force_plain_reply
            else [
                {
                    "type": "function",
                    "function": {
                        "name": "response_with_links",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "response_message": {
                                    "type": "string",
                                    "description": "A response message back to the user.",
                                },
                                "links": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "description": "Each link to send back to the user."
                                    },
                                    "description": "The list of link(s) to recommend the user to use",
                                },
                            },
                            "required": [
                                "response_message",
                                "links",
                            ],
                        },
                    },
                },
            ] if force_reply_with_links
            else [
                {
                    "type": "function",
                    "function": {
                        "name": "request_appointment",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "user_id": {
                                    "type": "integer",
                                    "description": "The id of the user to request the appointment for, this cannot be 20001 which is the default guest user id.",
                                },
                            },
                            "required": [
                                "user_id",
                            ],
                        },
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "response_with_links",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "response_message": {
                                    "type": "string",
                                    "description": "A response message back to the user.",
                                },
                                "links": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "description": "Each link to send back to the user."
                                    },
                                    "description": "The list of link(s) to recommend the user to use",
                                },
                            },
                            "required": [
                                "response_message",
                                "links",
                            ],
                        },
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "plain_response",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "response_message": {
                                    "type": "string",
                                    "description": "A response message back to the user.",
                                },
                            },
                            "required": [
                                "response_message",
                            ],
                        },
                    },
                },
            ],
            tool_choice="required",
        )

AIModel = Model()
