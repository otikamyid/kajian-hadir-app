
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tables } from '@/integrations/supabase/types';

type Participant = Tables<'participants'>;

interface DeleteParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
  onConfirm: () => void;
  deleting: boolean;
}

export function DeleteParticipantDialog({
  open,
  onOpenChange,
  participant,
  onConfirm,
  deleting
}: DeleteParticipantDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus Peserta</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus peserta <strong>{participant?.name}</strong>?
            <br /><br />
            Tindakan ini akan menghapus:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Data peserta</li>
              <li>Riwayat kehadiran peserta</li>
              <li>Akun pengguna terkait (jika ada)</li>
            </ul>
            <br />
            <strong>Tindakan ini tidak dapat dibatalkan.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Menghapus...' : 'Hapus Peserta'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
