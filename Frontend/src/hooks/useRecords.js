import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recordApi } from '../api/recordApi'
import toast from 'react-hot-toast'

export function useRecords(moduleId) {
  return useQuery({
    queryKey: ['records', moduleId],
    queryFn: () => recordApi.getByModule(moduleId),
    enabled: !!moduleId,
  })
}

export function useSearchRecords(moduleId, q) {
  return useQuery({
    queryKey: ['records', moduleId, 'search', q],
    queryFn: () => recordApi.search(moduleId, q),
    enabled: !!moduleId && !!q && q.length > 1,
  })
}

export function useCreateRecord(moduleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values) => recordApi.create(moduleId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', moduleId] })
      toast.success('Record saved!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to save record'),
  })
}

export function useUpdateRecord(moduleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }) => recordApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', moduleId] })
      toast.success('Record updated!')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update record'),
  })
}

export function useDeleteRecord(moduleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recordApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', moduleId] })
      toast.success('Record deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to delete record'),
  })
}
