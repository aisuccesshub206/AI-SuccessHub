import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';

/**
 * Checks if running inside a native mobile app container (iOS / Android).
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Resolve API endpoint URL properly depending on whether app is running
 * inside Capacitor web view or standard browser.
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  
  // In standard web browser contexts (non-native), use relative paths to route to the local express server directly
  if (typeof window !== 'undefined' && !isNativePlatform() && window.location.protocol.startsWith('http')) {
    return cleanPath;
  }

  // Custom API Base URL override for Capacitor mobile apps or explicitly defined APP_API_URL
  const customBaseUrl = 
    (import.meta as any).env?.VITE_API_BASE_URL || 
    (window as any).APP_API_URL || 
    '';

  if (customBaseUrl) {
    return `${customBaseUrl.replace(/\/$/, '')}${cleanPath}`;
  }

  return cleanPath;
};

/**
 * Mobile Photo / File Upload handler using Capacitor Camera with Web File Input fallback.
 */
export const selectMobilePhoto = async (): Promise<string | null> => {
  if (isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Allows Camera or Gallery choice
      });
      return image.dataUrl || null;
    } catch (err) {
      console.warn('Native camera cancelled or failed:', err);
      return null;
    }
  }

  // Fallback for Web: Return null so caller triggers standard <input type="file">
  return null;
};

/**
 * Native File Download/Save using Capacitor Filesystem with Web fallback.
 */
export const saveAndDownloadFile = async (
  filename: string,
  content: string | Blob | ArrayBuffer,
  mimeType: string = 'text/plain'
): Promise<boolean> => {
  if (isNativePlatform()) {
    try {
      let base64Data = '';
      if (typeof content === 'string') {
        if (content.startsWith('data:')) {
          base64Data = content.split(',')[1];
        } else {
          base64Data = btoa(content);
        }
      } else if (content instanceof Blob) {
        const arrayBuffer = await content.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Data = btoa(binary);
      }

      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
      });

      return true;
    } catch (err) {
      console.error('Filesystem save error:', err);
    }
  }

  // Web Browser Fallback
  try {
    let blob: Blob;
    if (content instanceof Blob) {
      blob = content;
    } else if (typeof content === 'string' && content.startsWith('data:')) {
      const res = await fetch(content);
      blob = await res.blob();
    } else {
      blob = new Blob([content as any], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Web download error:', err);
    return false;
  }
};

/**
 * Mobile Native File / Content Share with Web fallback.
 */
export const shareMobileContent = async (options: {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}): Promise<boolean> => {
  try {
    if (await Share.canShare().then(r => r.value).catch(() => false)) {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Share with AI SuccessHub',
      });
      return true;
    }
  } catch (err) {
    console.warn('Share error or cancelled:', err);
  }

  // Fallback
  if (navigator.share) {
    try {
      await navigator.share(options);
      return true;
    } catch (e) {
      // User cancelled
    }
  } else if (options.url) {
    navigator.clipboard.writeText(options.url);
    return true;
  }

  return false;
};

/**
 * Register Android Native Back Button Listener.
 */
export const registerBackButtonHandler = (onBack: () => void) => {
  if (!isNativePlatform()) return () => {};

  const listener = App.addListener('backButton', (data) => {
    if (!data.canGoBack) {
      App.exitApp();
    } else {
      onBack();
    }
  });

  return () => {
    listener.then(l => l.remove());
  };
};
