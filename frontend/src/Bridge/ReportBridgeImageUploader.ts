import Parse from 'parse';

export function uploadFiles(
  bridgeId: string,
  filesToUpload: File[]
): Promise<Parse.File[]> {
  return Promise.all(
    filesToUpload.map(async (file) => {
      const parseFile = new Parse.File(bridgeId, file);
      return await parseFile.save();
    })
  );
}
