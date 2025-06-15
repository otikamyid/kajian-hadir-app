
import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface FormBuilderOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enableLogging?: boolean;
}

export function useFormBuilder<T extends FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  enableLogging = true,
  ...formOptions
}: FormBuilderOptions<T>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...formOptions,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    if (enableLogging) {
      logger.info('Form submission started', { formData: data });
    }

    try {
      await onSubmit(data);
      
      if (enableLogging) {
        logger.info('Form submission successful');
      }
      
      onSuccess?.(data);
      
      toast({
        title: "Success",
        description: "Form submitted successfully",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (enableLogging) {
        logger.error('Form submission failed', { error: errorMessage });
      }
      
      onError?.(error as Error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const setFieldError = (field: Path<T>, message: string) => {
    form.setError(field, { type: 'manual', message });
  };

  const clearErrors = () => {
    form.clearErrors();
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
    setFieldError,
    clearErrors,
    formState: form.formState,
    register: form.register,
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    reset: form.reset,
  };
}
