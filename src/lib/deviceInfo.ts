import { UAParser } from 'ua-parser-js';
import { DeviceInfo } from './types';

export const detectDeviceInfo = (): DeviceInfo => {
  const parser = new UAParser();
  const result = parser.getResult();

  // Determine device type based on device type and model
  let deviceType = 'unknown';
  if (result.device.type) {
    deviceType = result.device.type;
  } else if (result.device.model) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  // Get browser name as app name
  const appName = result.browser.name || 'unknown';

  return {
    deviceType,
    appName,
    metadata: result,
  };
};
