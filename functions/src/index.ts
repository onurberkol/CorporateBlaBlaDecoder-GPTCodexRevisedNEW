import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';
import { REGION } from './config';

initializeApp();
setGlobalOptions({ region: REGION, maxInstances: 20 });

export { decode } from './decode';
export { compose } from './compose';
export { openPlaza } from './plaza';
export { revenuecatWebhook } from './revenuecat';
export { reengageLapsed } from './reengage';
export { deleteAccount } from './account';
