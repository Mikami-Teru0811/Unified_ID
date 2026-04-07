import threading
import time
from typing import Optional, Dict, Any, List
from enum import Enum
from dataclasses import dataclass, field


class OperationState(Enum):
    IDLE = "idle"
    IN_PROGRESS = "in_progress"
    WAITING_HARDWARE = "waiting_hardware"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# Default timeout for all operations (30 seconds)
DEFAULT_OPERATION_TIMEOUT = 30


@dataclass
class Operation:
    operation_id: str
    operation_type: str
    state: OperationState = OperationState.IDLE
    step: str = "initial"
    data: Dict[str, Any] = field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    timeout_seconds: int = DEFAULT_OPERATION_TIMEOUT


class StateManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._operations: Dict[str, Operation] = {}
        
    def create_operation(self, operation_id: str, operation_type: str, timeout: int = 60) -> Operation:
        with self._lock:
            op = Operation(
                operation_id=operation_id,
                operation_type=operation_type,
                timeout_seconds=timeout
            )
            self._operations[operation_id] = op
            return op
    
    def get_operation(self, operation_id: str) -> Optional[Operation]:
        with self._lock:
            return self._operations.get(operation_id)
    
    def get_current_operation(self) -> Optional[Operation]:
        with self._lock:
            # Return the most recent active operation
            active_ops = [
                op for op in self._operations.values()
                if op.state in [OperationState.IN_PROGRESS, OperationState.WAITING_HARDWARE]
            ]
            if active_ops:
                return sorted(active_ops, key=lambda x: x.created_at, reverse=True)[0]
            return None
    
    def get_operations_by_type(self, operation_type: str) -> List[Operation]:
        with self._lock:
            return [
                op for op in self._operations.values()
                if op.operation_type == operation_type
                and op.state in [OperationState.IN_PROGRESS, OperationState.WAITING_HARDWARE]
            ]
    
    def get_operations_by_state(self, state: OperationState) -> List[Operation]:
        with self._lock:
            return [op for op in self._operations.values() if op.state == state]
    
    def update_operation(self, operation_id: str, **kwargs) -> Optional[Operation]:
        with self._lock:
            op = self._operations.get(operation_id)
            if op:
                for key, value in kwargs.items():
                    if hasattr(op, key):
                        setattr(op, key, value)
                op.updated_at = time.time()
            return op
    
    def set_step(self, operation_id: str, step: str, data: Optional[Dict[str, Any]] = None) -> Optional[Operation]:
        with self._lock:
            op = self._operations.get(operation_id)
            if op:
                op.step = step
                op.state = OperationState.WAITING_HARDWARE
                if data:
                    op.data.update(data)
                op.updated_at = time.time()
            return op
    
    def complete_operation(self, operation_id: str, result: Dict[str, Any]) -> Optional[Operation]:
        with self._lock:
            op = self._operations.get(operation_id)
            if op:
                op.state = OperationState.COMPLETED
                op.result = result
                op.updated_at = time.time()
            return op
    
    def fail_operation(self, operation_id: str, error: str) -> Optional[Operation]:
        with self._lock:
            op = self._operations.get(operation_id)
            if op:
                op.state = OperationState.FAILED
                op.error = error
                op.updated_at = time.time()
            return op
    
    def cancel_operation(self, operation_id: str) -> Optional[Operation]:
        with self._lock:
            op = self._operations.get(operation_id)
            if op:
                op.state = OperationState.CANCELLED
                op.updated_at = time.time()
            return op
    
    def cancel_all_operations(self):
        with self._lock:
            for op in self._operations.values():
                op.state = OperationState.CANCELLED
                op.updated_at = time.time()
    
    def cancel_operations_by_type(self, operation_type: str):
        with self._lock:
            for op in self._operations.values():
                if op.operation_type == operation_type:
                    op.state = OperationState.CANCELLED
                    op.updated_at = time.time()
    
    def cleanup_old_operations(self, max_age_seconds: int = 300):
        with self._lock:
            current_time = time.time()
            expired_ids = [
                op_id for op_id, op in self._operations.items()
                if current_time - op.updated_at > max_age_seconds
                and op.state in [OperationState.COMPLETED, OperationState.FAILED, OperationState.CANCELLED]
            ]
            for op_id in expired_ids:
                del self._operations[op_id]
    
    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            operations = [
                {
                    "id": op.operation_id,
                    "type": op.operation_type,
                    "state": op.state.value,
                    "step": op.step,
                    "age_seconds": time.time() - op.created_at
                }
                for op in self._operations.values()
            ]
            return {
                "total_operations": len(self._operations),
                "operations": operations
            }


state_manager = StateManager()
