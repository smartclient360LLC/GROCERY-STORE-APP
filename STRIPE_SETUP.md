# Stripe Configuration

## ✅ Keys Configured

Your Stripe test keys have been configured:

### Backend (Payment Service)
- **Secret Key**: Configured in `backend/payment-service/src/main/resources/application.yml`
- **Public Key**: Configured (for reference)
- **Location**: Port 8086

### Frontend
- **Public Key**: Configured in `frontend/.env`
- The frontend will automatically load this when you run `npm run dev`

## 🔑 Current Keys

- **Public Key**: `pk_test_...` (Set via `STRIPE_PUBLIC_KEY` environment variable)
- **Secret Key**: `sk_test_...` (Set via `STRIPE_SECRET_KEY` environment variable - **DO NOT COMMIT**)

⚠️ **Never commit actual secret keys to version control!** Use environment variables instead.

## 🧪 Testing Payments

### Test Card Numbers (Stripe Test Mode)

Use these test card numbers in the checkout form:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**For all test cards:**
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

## 🔒 Security Notes

⚠️ **Important**: These are TEST keys. Never commit production keys to version control.

- The `.env` file is in `.gitignore` (should be)
- For production, use environment variables or a secrets management service
- Never expose your secret key in frontend code

## 📝 Webhook Setup (Optional)

To receive payment status updates via webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:8086/api/payments/webhook`
4. Copy the webhook signing secret and set `STRIPE_WEBHOOK_SECRET` environment variable

## 🚀 Next Steps

1. Restart the payment service if it's running:
   ```bash
   cd backend/payment-service
   ./run.sh
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Test the checkout flow with a test card!

