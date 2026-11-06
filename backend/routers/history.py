from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.core.security import get_current_user
from backend.models.chat_history import ChatHistory


router = APIRouter(
    prefix="/api/history",
    tags=["Chat History"]
)


@router.get("")
def get_chat_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id
        )
        .order_by(
            ChatHistory.created_at.desc()
        )
        .all()
    )

    return {
        "status": "success",
        "count": len(history),
        "history": [
            {
                "id": item.id,
                "question": item.question,
                "answer": item.answer,
                "source_type": item.source_type,
                "created_at": item.created_at
            }
            for item in history
        ]
    }


@router.delete("/{history_id}")
def delete_chat_history(
    history_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == history_id,
            ChatHistory.user_id == current_user.id
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Chat history not found"
        )

    db.delete(history)
    db.commit()

    return {
        "status": "success",
        "message": "Chat history deleted successfully"
    }