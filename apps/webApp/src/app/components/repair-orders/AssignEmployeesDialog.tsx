import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { userService, User } from '../../requests/user.requests';
import {
  repairOrderRequests,
  RepairOrder,
  ROEmployee,
} from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { EmployeeChipSelector } from '../appointments/EmployeeChipSelector';

interface AssignEmployeesDialogProps {
  open: boolean;
  onClose: () => void;
  roId: string;
  currentEmployees: ROEmployee[];
  onSaved: (updated: RepairOrder) => void;
}

/**
 * Reassigns the employees on a repair order. The first selected employee becomes
 * the Lead and the rest Assistants (the backend derives roles from order); an
 * empty selection clears all assignments. Reuses EmployeeChipSelector so the
 * picker matches the appointment flow.
 */
export function AssignEmployeesDialog({
  open,
  onClose,
  roId,
  currentEmployees,
  onSaved,
}: AssignEmployeesDialogProps) {
  const { showApiError } = useErrorHelpers();
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    userService
      .getUsers()
      .then((allUsers) => {
        if (!active) return;
        const staffAndAdmin = allUsers.filter(
          (user) =>
            (user.role?.name === 'STAFF' ||
              user.role?.name === 'ADMIN' ||
              user.role?.name === 'SUPERVISOR') &&
            user.isActive
        );
        const uniqueUsers = staffAndAdmin.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        setEmployees(uniqueUsers);
        // Pre-select the RO's current employees by matching userId.
        const currentUserIds = new Set(currentEmployees.map((e) => e.userId));
        setSelectedEmployees(
          uniqueUsers.filter((u) => currentUserIds.has(u.id))
        );
      })
      .catch((error) => showApiError(error, 'Failed to load employees.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roId]);

  const handleToggle = (employee: User) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((e) => e.id === employee.id);
      return isSelected
        ? prev.filter((e) => e.id !== employee.id)
        : [...prev, employee];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await repairOrderRequests.update(roId, {
        employeeIds: selectedEmployees.map((e) => e.id),
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      showApiError(error, 'Failed to update assigned employees.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Assign Employees</DialogTitle>
      <DialogContent>
        <EmployeeChipSelector
          employees={employees}
          selectedEmployees={selectedEmployees}
          availableSlots={[]}
          scheduledTime=""
          onEmployeeToggle={handleToggle}
          loading={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
