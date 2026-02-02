import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'dsv_clients';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>(STORAGE_KEY, []);

  const createClient = useCallback(
    (clientData: Omit<Client, 'id' | 'totalOrders' | 'totalValue' | 'createdAt' | 'updatedAt'>) => {
      const newClient: Client = {
        ...clientData,
        id: crypto.randomUUID(),
        totalOrders: 0,
        totalValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setClients((prev) => [newClient, ...prev]);
      toast.success('Client added successfully', {
        description: `${newClient.name} has been added to your clients.`,
      });
      return newClient;
    },
    [setClients]
  );

  const updateClient = useCallback(
    (id: string, updates: Partial<Client>) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === id
            ? { ...client, ...updates, updatedAt: new Date().toISOString() }
            : client
        )
      );
      toast.success('Client updated successfully');
    },
    [setClients]
  );

  const deleteClient = useCallback(
    (id: string) => {
      setClients((prev) => prev.filter((client) => client.id !== id));
      toast.success('Client deleted successfully');
    },
    [setClients]
  );

  const updateClientStats = useCallback(
    (clientId: string, orderTotal: number) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                totalOrders: client.totalOrders + 1,
                totalValue: client.totalValue + orderTotal,
                updatedAt: new Date().toISOString(),
              }
            : client
        )
      );
    },
    [setClients]
  );

  const getClientById = useCallback(
    (id: string) => {
      return clients.find((client) => client.id === id);
    },
    [clients]
  );

  const searchClients = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return clients.filter(
        (client) =>
          client.name.toLowerCase().includes(lowerQuery) ||
          client.company.toLowerCase().includes(lowerQuery) ||
          client.email.toLowerCase().includes(lowerQuery)
      );
    },
    [clients]
  );

  return {
    clients,
    createClient,
    updateClient,
    deleteClient,
    updateClientStats,
    getClientById,
    searchClients,
  };
}
