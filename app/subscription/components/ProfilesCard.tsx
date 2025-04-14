import React from 'react';
import { UserCircle, PlusCircle, Pencil } from 'lucide-react';

// Types for a child profile
export interface ChildProfile {
  id: string;
  name: string;
  age?: number;
  avatarUrl?: string;
}

interface ProfilesCardProps {
  profiles: ChildProfile[];
  onAddProfile?: () => void;
  onEditProfile?: (id: string) => void;
}

/**
 * ProfilesCard displays a list of child profiles and allows adding/editing.
 * Props:
 *  - profiles: array of child profiles
 *  - onAddProfile: callback for adding a new profile
 *  - onEditProfile: callback for editing a profile
 */
const ProfilesCard: React.FC<ProfilesCardProps> = ({ profiles, onAddProfile, onEditProfile }) => {
  return (
    <div className="mb-8">
      <div className="rounded-xl bg-white shadow-sm border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full p-2">
            <UserCircle className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">Profiles</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {profiles.length === 0 && (
            <span className="text-slate-500">No profiles yet. Add your first child profile!</span>
          )}
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col items-center bg-slate-50 rounded-lg p-4 shadow-sm min-w-[120px]"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-12 w-12 rounded-full mb-2 object-cover border"
                />
              ) : (
                <UserCircle className="h-12 w-12 text-slate-400 mb-2" />
              )}
              <span className="font-semibold text-slate-800 mb-1">{profile.name}</span>
              {profile.age !== undefined && (
                <span className="text-xs text-slate-500 mb-2">Age {profile.age}</span>
              )}
              <button
                className="flex items-center text-xs text-violet-600 hover:underline mt-1"
                onClick={() => onEditProfile && onEditProfile(profile.id)}
                aria-label={`Edit profile for ${profile.name}`}
              >
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </button>
            </div>
          ))}
          {/* Add Profile Button */}
          <button
            className="flex flex-col items-center justify-center bg-violet-50 hover:bg-violet-100 rounded-lg p-4 border-2 border-dashed border-violet-200 min-w-[120px] transition"
            onClick={onAddProfile}
            aria-label="Add new profile"
            type="button"
          >
            <PlusCircle className="h-8 w-8 text-violet-500 mb-1" />
            <span className="font-semibold text-violet-700">Add Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilesCard;
