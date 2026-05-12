This fixes realtime sync not uploading automatically.

The old setup only synced when you pressed Upload Local / Download Cloud or manually called pushSaveKeyToSupabase.

This package adds:
- AutoRealtimeSync global component
- automatic upload when tracked localStorage keys change
- realtime download listener
- monthly reset keys added to sync

Follow LAYOUT_PATCH.md.
