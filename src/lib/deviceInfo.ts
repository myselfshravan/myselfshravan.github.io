import DeviceDetector from 'device-detector-js';
import { DeviceInfo } from './types';

export const detectDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;

  const deviceDetector = new DeviceDetector();

  // Parse the user agent string using device-detector-js
  const parsedDevice = deviceDetector.parse(userAgent);

  // Extract device and app (browser) information
  const deviceType = parsedDevice.device?.type || 'unknown';
  const appName = parsedDevice.client?.name || 'unknown';

  return {
    deviceType,
    appName,
  };
};
