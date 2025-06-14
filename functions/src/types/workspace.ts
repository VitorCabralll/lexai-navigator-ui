
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: FirebaseFirestore.Timestamp;
}
