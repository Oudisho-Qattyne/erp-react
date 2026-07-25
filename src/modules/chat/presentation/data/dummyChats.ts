export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  status: MessageStatus;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

export const dummyContacts: Contact[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    avatar: 'أ',
    lastMessage: 'تم تحديث البيانات بنجاح',
    lastTime: '10:32',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', text: 'السلام عليكم', time: '10:15', sent: false, status: 'read' },
      { id: 'm2', text: 'وعليكم السلام، كيف يمكنني مساعدتك؟', time: '10:16', sent: true, status: 'read' },
      { id: 'm3', text: 'أريد تحديث بيانات الموظفين الجدد', time: '10:18', sent: false, status: 'delivered' },
      { id: 'm4', text: 'تم تحديث البيانات بنجاح', time: '10:20', sent: true, status: 'read' },
      { id: 'm5', text: 'يمكنك مراجعة القائمة الآن', time: '10:21', sent: true, status: 'delivered' },
      { id: 'm6', text: 'شكراً جزيلاً', time: '10:32', sent: false, status: 'delivered' },
    ],
  },
  {
    id: '2',
    name: 'سارة علي',
    avatar: 'س',
    lastMessage: 'حسناً سأنهي المهمة اليوم',
    lastTime: '09:45',
    unread: 0,
    online: true,
    messages: [
      { id: 'm7', text: 'هل انتهيت من تقرير المبيعات؟', time: '09:30', sent: true, status: 'read' },
      { id: 'm8', text: 'لم أنته بعد، سأرسله قريباً', time: '09:35', sent: false, status: 'read' },
      { id: 'm9', text: 'حسناً سأنهي المهمة اليوم', time: '09:45', sent: false, status: 'read' },
    ],
  },
  {
    id: '3',
    name: 'محمد عمر',
    avatar: 'م',
    lastMessage: 'تم الموافقة على الطلب',
    lastTime: '08:20',
    unread: 1,
    online: false,
    messages: [
      { id: 'm10', text: 'هل تمت الموافقة على طلب الإجازة؟', time: '08:10', sent: true, status: 'read' },
      { id: 'm11', text: 'تم الموافقة على الطلب', time: '08:20', sent: false, status: 'delivered' },
    ],
  },
  {
    id: '4',
    name: 'نورة خالد',
    avatar: 'ن',
    lastMessage: 'سأحضر الاجتماع في الموعد المحدد',
    lastTime: 'الأمس',
    unread: 0,
    online: false,
    messages: [
      { id: 'm12', text: 'موعد الاجتماع غداً الساعة 10 صباحاً', time: 'الأمس 15:00', sent: true, status: 'read' },
      { id: 'm13', text: 'سأحضر الاجتماع في الموعد المحدد', time: 'الأمس 15:30', sent: false, status: 'read' },
    ],
  },
  {
    id: '5',
    name: 'فهد عبدالله',
    avatar: 'ف',
    lastMessage: 'يرجى مراجعة المستندات المرفقة',
    lastTime: 'الأمس',
    unread: 3,
    online: false,
    messages: [
      { id: 'm14', text: 'لقد أرسلت المستندات المطلوبة', time: 'الأمس 12:00', sent: false, status: 'delivered' },
      { id: 'm15', text: 'يرجى مراجعة المستندات المرفقة', time: 'الأمس 12:05', sent: false, status: 'delivered' },
    ],
  },
];
