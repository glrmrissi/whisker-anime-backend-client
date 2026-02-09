// import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

// export class Migration1770164018983 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         queryRunner.createTable(
//             new Table({
//                 name: "notifications",
//                 columns: [
//                     {
//                         name: "id",
//                         type: "int",
//                         isPrimary: true,
//                         isGenerated: true,
//                         generationStrategy: "increment",
//                     },
//                     {
//                         name: "subject",
//                         type: "varchar",
//                     },
//                     {
//                         name: "message",
//                         type: "text",
//                     },
//                     {
//                         name: "recipient",
//                         type: "varchar",
//                     },
//                     {
//                         name: "sendEmailToAdmin",
//                         type: "boolean",
//                         default: false,
//                     },
//                     {
//                         name: "pushNotification",
//                         type: "boolean",
//                         default: false,
//                     },
//                     {
//                         name: "createdAt",
//                         type: "timestamp",
//                         default: "now()",
//                     },
//                     {
//                         name: "updatedAt",
//                         type: "timestamp",
//                         default: "now()",
//                     },
//                     {
//                         name: "deletedAt",
//                         type: "timestamp",
//                         default: null,
//                     },

//                 ],
//             })
//         );
//         await queryRunner.createIndex("notifications", new TableIndex({
//             name: "IDX_NOTIFICATIONS_RECIPIENT",
//             columnNames: ["recipient"],
//         })
//         );
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         queryRunner.dropTable("notifications");
//     }
// }