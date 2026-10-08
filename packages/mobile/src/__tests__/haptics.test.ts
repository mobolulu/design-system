import * as ExpoHaptics from 'expo-haptics';
import { haptics } from '../lib/haptics';

describe('haptics', () => {
  it('fires a success notification', () => {
    haptics.success();
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(ExpoHaptics.NotificationFeedbackType.Success);
  });

  it('fires an error notification', () => {
    haptics.error();
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(ExpoHaptics.NotificationFeedbackType.Error);
  });

  it('fires a light impact for a tap', () => {
    haptics.tap();
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith(ExpoHaptics.ImpactFeedbackStyle.Light);
  });

  it('never throws even if the native call rejects', async () => {
    (ExpoHaptics.notificationAsync as jest.Mock).mockRejectedValueOnce(new Error('no haptics engine'));
    expect(() => haptics.success()).not.toThrow();
    // flush the rejected promise's microtask before the suite ends
    await Promise.resolve().then(() => {});
  });
});
