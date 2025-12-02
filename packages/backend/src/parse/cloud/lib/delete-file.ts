Parse.Cloud.define('deleteFile', async (req) => {
  const { filename } = req.params;
  if (!filename) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      'Missing filename parameter'
    );
  }

  // Check if user is authenticated
  if (!req.user) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  // @ts-expect-error types are outdated
  const file = new Parse.File(filename);
  try {
    await file.destroy({ useMasterKey: true });
    return 'File deleted successfully';
  } catch {
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      'Failed to delete file'
    );
  }
});
