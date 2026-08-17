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

const ASSIGNABLE_ROLES = ['STAFF', 'ADMIN', 'SUPERVISOR', 'FOREMAN'];

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
        // Same roles the appointment and RO-creation pickers offer — FOREMAN
        // included, or a foreman assigned on the appointment could never be
        // added here.
        const currentUserIds = new Set(currentEmployees.map((e) => e.userId));
        const assignable = allUsers.filter(
          (user) =>
            (ASSIGNABLE_ROLES.includes(user.role?.name ?? '') &&
              user.isActive) ||
            // Anyone already on the RO stays in the list whatever their role or
            // active state. Saving replaces the whole crew, so dropping them
            // from the options would silently unassign them.
            currentUserIds.has(user.id)
        );
        const uniqueUsers = assignable.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        setEmployees(uniqueUsers);
        // Pre-select the RO's current employees by matching userId.
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
