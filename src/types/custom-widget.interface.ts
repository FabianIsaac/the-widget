
export interface CustomWidgetInterface {
    title: string;
    content?: string;
    icon?: string;
    iconColor?: string;
    iconPosition?: 'left' | 'right';
    data?: string;
    query?: string;
    size?: 'small' | 'medium' | 'large' | 'full';
}
