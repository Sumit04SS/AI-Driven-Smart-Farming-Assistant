from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.schemas.user import UpdateProfileRequest


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user)
):
    return {
        "status": "success",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at
        }
    }


@router.put("/me")
def update_my_profile(
    profile_data: UpdateProfileRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if profile_data.name is not None:
        current_user.name = profile_data.name

    if profile_data.email is not None:

        existing_user = (
            db.query(User)
            .filter(
                User.email == profile_data.email,
                User.id != current_user.id
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        current_user.email = profile_data.email

    db.commit()
    db.refresh(current_user)

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at
        }
    }