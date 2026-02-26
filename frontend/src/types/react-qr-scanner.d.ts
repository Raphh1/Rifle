declare module 'react-qr-scanner' {
  import * as React from 'react';

  export interface QrScannerProps {
    onError: (error: unknown) => void;
    onScan: (data: unknown) => void;
    style?: React.CSSProperties;
    constraints?: MediaStreamConstraints;
    delay?: number;
  }

  export default class QrScanner extends React.Component<QrScannerProps> {}
}
