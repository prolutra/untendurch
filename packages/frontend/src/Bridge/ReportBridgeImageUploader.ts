import Parse from 'parse';

export function uploadFiles(
  bridgeId: string,
  filesToUpload: { name: string; url: string }[]
): Promise<Parse.File[]> {
  return Promise.all(
    filesToUpload.map(async (file) => {
      const parseFile = new Parse.File(bridgeId, { uri: file.url });
      return await parseFile.save();
    })
  );
}
