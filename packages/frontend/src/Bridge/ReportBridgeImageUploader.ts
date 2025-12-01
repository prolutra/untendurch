import Parse from 'parse';

export async function uploadFiles(
  bridgeId: string,
  filesToUpload: { name: string; url: string }[]
): Promise<Parse.File[]> {
  const results = await Promise.all(
    filesToUpload.map(async (file) => {
      const parseFile = new Parse.File(bridgeId, { uri: file.url });
      return parseFile.save();
    })
  );
  return results.filter((file): file is Parse.File => file !== undefined);
}
