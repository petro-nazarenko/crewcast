export const CREWINSPECTOR_COMPANIES: Record<string, { siteId: string; url: string }> = {
  orca: {
    siteId: 'crewinspector-orca',
    url: 'https://orca.crewinspector.com/public/selfservice?',
  },
};
export const CI_CONFIG = {
  waitForReadyExpression: "document.querySelector('#a-seaman') !== null",
  saveConfirmationExpression: "document.querySelector('.img_loader:visible') === null || document.querySelector('.img_loader').style.display === 'none'",
};
