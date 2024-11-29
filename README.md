# Restaurant Management System

A modern restaurant management system that provides payment, menu management and sales reporting functionalities.

## Demo

Demo Link: [Please wait](https://order-system-admin.vercel.app/)

## Features

### Payment

- Cashier mode
- Process payment
- Responsive design for both mobile and desktop

### Menu Management

- Add, edit, and delete menu items
- Upload dish images
- Filter dishes by category
- Responsive design for both mobile and desktop

### Sales Reports

- View monthly and yearly sales reports
- Custom date range sales data
- Graphical visualization of sales trends
- Sales statistics by category

## Tech Stack

- **Frontend Framework**: React + TypeScript
- **UI Components**: Ant Design
- **Charts**: Recharts
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository

```bash
git clone https://github.com/chyuanhan/order_system_admin.git
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file and add the following:

```bash
VITE_BACKEND_URL=your_backend_url
VITE_BACKEND_ASSET_URL=your_asset_url
```

4. Start development server

```bash
npm run dev
```

## Project Structure

├── components/
│ ├── MenuItemModal.tsx # Menu item edit modal
│ └── TopBar.tsx # Top navigation bar
├── pages/
│ └── Admin/
│ ├── MenuManagement.tsx # Menu management page
│ └── SalesReport.tsx # Sales report page
└── context/
└── AuthContext.tsx # Authentication context

## API Endpoints

### Payment

- `GET /orders?unpaid=true` - Get unpaid orders
- `POST /payments` - Process payment

### Menu Management

- `GET /menu` - Get all menu items
- `POST /menu` - Add a new menu item
- `PUT /menu/:id` - Update a menu item
- `DELETE /menu/:id` - Delete a menu item

### Sales Reports

- `GET /reports/current-month` - Get current month report
- `GET /reports/yearly` - Get yearly report
- `GET /reports/custom` - Get custom date range report

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
