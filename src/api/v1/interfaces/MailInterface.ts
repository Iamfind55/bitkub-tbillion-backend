export interface MailOption {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }