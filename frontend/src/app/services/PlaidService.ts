"use client";
import API_BASE_URL from "@/app/config";

export const PLAID_ACCESS_TOKEN_KEY = 'plaid_access_token';

export class PlaidService {
  static async generateLinkToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/Plaid/link-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientUserId: 'user-id' }),
      });
      if (!response.ok) throw new Error('Failed to generate link token');
      return await response.json();
    } catch (error) {
      console.error('Error generating link token:', error);
      return null;
    }
  }

  static async exchangePublicToken(publicToken: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plaid/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken }),
      });
      if (!response.ok) throw new Error('Failed to exchange public token');
      return await response.json();
    } catch (error) {
      console.error('Error exchanging public token:', error);
      return null;
    }
  }

  static async fetchAccounts(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plaid/accounts?accessToken=${token}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return null;
    }
  }

  static async syncTransactions(userId: string, token: string, cursor?: string, count = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plaid/transactions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessToken: token, cursor, count }),
      });
      if (!response.ok) throw new Error('Failed to sync transactions');
      return await response.json();
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return null;
    }
  }

  static disconnectBank() {
    localStorage.removeItem(PLAID_ACCESS_TOKEN_KEY);
  }
}
