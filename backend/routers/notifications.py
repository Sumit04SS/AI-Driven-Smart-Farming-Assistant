from fastapi import APIRouter, Depends

from backend.core.security import get_current_user
from backend.database import SessionLocal
from backend.models.notification import Notification


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.get("")
def get_notifications(
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .all()
        )

        return {
            "status": "success",
            "notifications": [
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": notification.notification_type,
                    "is_read": notification.is_read,
                    "created_at": notification.created_at,
                }
                for notification in notifications
            ],
        }

    finally:
        db.close()


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == current_user.id,
            )
            .first()
        )

        if not notification:
            return {
                "status": "error",
                "message": "Notification not found or not owned by you.",
            }

        notification.is_read = True

        db.commit()
        db.refresh(notification)

        return {
            "status": "success",
            "message": "Notification marked as read.",
            "notification": {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            },
        }

    finally:
        db.close()