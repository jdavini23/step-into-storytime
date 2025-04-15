import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChildProfile } from './ProfilesCard';

interface ProfileDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialProfile?: Partial<ChildProfile>;
  loading?: boolean;
  error?: string | null;
  onSave: (profile: { name: string; age?: number; avatarUrl?: string }) => void;
  onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  mode,
  initialProfile = {},
  loading = false,
  error = null,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialProfile.name || '');
  const [age, setAge] = useState(initialProfile.age?.toString() || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setName(initialProfile.name || '');
    setAge(initialProfile.age?.toString() || '');
    setAvatarUrl(initialProfile.avatarUrl || '');
    setTouched(false);
  }, [open, initialProfile]);

  const handleSave = () => {
    if (!name.trim()) return setTouched(true);
    onSave({ name: name.trim(), age: age ? Number(age) : undefined, avatarUrl: avatarUrl.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Profile' : 'Edit Profile'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Name <span className="text-red-500">*</span></span>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter name"
              required
              className={touched && !name.trim() ? 'border-red-500' : ''}
              autoFocus
            />
            {touched && !name.trim() && <span className="text-xs text-red-500">Name is required.</span>}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Age</span>
            <Input
              type="number"
              min={0}
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Avatar URL</span>
            <Input
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="Optional (paste image URL)"
            />
          </label>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} type="button" disabled={loading}>
            {loading && <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>}
            {mode === 'add' ? 'Add Profile' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
