# Sign4Good

Sign4Good is a revolutionary web platform that brings transparency and accountability to the non-profit sector. It serves as a bridge between NGOs and donors, ensuring that donated funds are used effectively and as intended.

## Overview

Sign4Good is designed exclusively for verified non-profits, featuring:

- **Secure Authentication**: Integrated with DocuSign for robust identity verification
- **Multi-tenant Architecture**: Support for managing multiple NGOs from a single account
- **Smart Compliance**: AI-powered form generation based on donation agreements
- **Transparent Tracking**: Public access to submitted compliance forms
- **Merit-based Ranking**: Proprietary algorithm to evaluate and rank NGOs based on their compliance and mission-driven activities

## Key Features

- **DocuSign Integration**: Seamless import of signed donation agreements
- **Automated Compliance Forms**: AI-generated forms based on agreement terms
- **AWS SQS Processing**: Asynchronous processing of forms and agreements
- **Role-based Access Control**: Different roles for donors, NGO admins, and compliance officers
- **Transparency Dashboard**: Public visibility of NGO activities and compliance
- **Smart Ranking System**: Promotes ethical NGOs while identifying potential fraud

## Development Setup

### Prerequisites

1. Install [Bun](https://bun.sh/docs/installation)
2. Clone the repository
3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
4. Fill in the required environment variables

### Installation

```bash
# Install dependencies
bun i

# Start development server
bun run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.