export const SAILINGA_CONFIG = {
  siteId: 'sailinga',
  siteUrl: 'http://www.sailinga.lt/?tip=af',
  maxCerts: 9,
  maxSeaService: 10,
  waitForReadyExpression: "document.querySelectorAll('select').length > 2",
  submitLocator: 'input[value="Send"], button:has-text("Send")',
  declareFieldName: 'declare',
  cvLocator: 'input[name="attachment"]',
  photoLocator: 'input[name="foto"]',
};
