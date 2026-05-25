import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/userApi'
import toast from 'react-hot-toast'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => userApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update user'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User removed')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to delete user'),
  })
}
