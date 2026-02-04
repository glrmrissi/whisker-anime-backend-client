import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

interface Notification {
    subject: string;
    message: string;
    recipient: string;
}

interface NotifierRouterOptions {
    adminEmails: boolean;
    clientEmail: string;
}

@Injectable()
export class NotifierService {
    constructor(
        @InjectQueue('notifier-router-queue') private notifierRouterQueue: Queue
    ) {}
    // Enabled for testing purposes
    // async onModuleInit() {
    //     await this.notify(
    //         { subject: 'Ronaldo', message: 'Ronaldo', recipient: 'ronaldo@exemplo.com' },
    //         { adminEmails: true, clientEmail: 'client@example.com' }
    //     );
    // }
    async notify(notification: Notification, options: NotifierRouterOptions): Promise<void> {
        console.log('NotifierService notify called with:', notification, options);
        await this.notifierRouterQueue.add('send-notification', {
            subject: notification.subject,
            message: notification.message,
            recipient: notification.recipient,
            options,
        }, {
            removeOnComplete: true,
            attempts: 5,
        });
    }
}