import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleApi } from '../api/moduleApi'
import toast from 'react-hot-toast'

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: moduleApi.getAll,
  })
}

export function useModule(id) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => moduleApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: moduleApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module created!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to create module'),
  })
}

export function useUpdateModule(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => moduleApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      qc.invalidateQueries({ queryKey: ['module', id] })
      toast.success('Module updated!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update module'),
  })
}

export function useDeleteModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: moduleApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to delete module'),
  })
}
