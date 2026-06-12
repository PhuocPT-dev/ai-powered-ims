import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Intern Management System API',
            version: '1.0.0',
            description: 'Tài liệu API chuyên nghiệp cho Hệ thống quản lý Thực tập sinh',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Máy chủ Local'
            },
        ],
        components: {
            // Cấu hình chìa khóa Token (Authorize) ở góc phải màn hình
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    // Chạm vòi hút vào toàn bộ thư mục routes để nó tự động đọc code
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('✅ Swagger Docs đã khởi chạy tại: http://localhost:5000/api-docs');
};
