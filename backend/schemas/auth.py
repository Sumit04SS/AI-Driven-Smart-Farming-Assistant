from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, Header
from backend.models.token import BlacklistedToken

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str