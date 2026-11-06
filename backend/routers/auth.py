from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
import uuid

from backend.database import get_db
from backend.models.user import User
from backend.schemas.auth import RegisterRequest, LoginRequest
from fastapi import APIRouter, Depends, HTTPException, Header
from backend.models.token import BlacklistedToken


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


SECRET_KEY = "smart-farming-secret-key"
ALGORITHM = "HS256"


@router.post("/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    password_hash = pwd_context.hash(
        user_data.password
    )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@router.post("/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = pwd_context.verify(
        user_data.password,
        user.password_hash
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = jwt.encode(
    {
        "sub": str(user.id),
        "email": user.email,
        "jti": str(uuid.uuid4())
    },
    SECRET_KEY,
    algorithm=ALGORITHM
)

    return {
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@router.post("/logout")
def logout(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    existing_token = (
        db.query(BlacklistedToken)
        .filter(
            BlacklistedToken.token == token
        )
        .first()
    )

    if existing_token:
        return {
            "status": "success",
            "message": "Already logged out"
        }

    blacklisted_token = BlacklistedToken(
        token=token
    )

    db.add(blacklisted_token)
    db.commit()

    return {
        "status": "success",
        "message": "Logout successful"
    }