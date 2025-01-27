'use client';

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { FormField } from "@/app/crons/utils/pdfToForm";
import dayjs from "dayjs";
import { complianceForms, monitoredEnvelopes } from "@/drizzle/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarIcon, FileTextIcon, InfoIcon, ImageIcon, ExternalLinkIcon } from "lucide-react";
import { getValidationSchemaFromSchema } from "./validationSchema";
import { handleFormSubmission } from "./handleFormSubmission.server";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Common styles
const inputBaseClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelBaseClass = "block text-sm font-medium text-gray-700 mb-1";
const errorClass = "text-red-500 text-sm mt-1";
const helperTextClass = "text-gray-500 text-sm mt-1";

function FormFieldComponent({ field, control, errors, register, readOnly = false, submittedValue, submittedProof }: {
    field: FormField,
    control: any,
    errors: any,
    register: any,
    readOnly?: boolean,
    submittedValue?: any,
    submittedProof?: {
        url: string;
        name: string;
        size: number;
        type: string;
    }
}) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const renderProofPreview = () => {
        if (!submittedProof) return null;

        const isImage = submittedProof.type.startsWith('image/');
        
        return (
            <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {isImage ? <ImageIcon className="h-4 w-4 text-blue-500" /> : <FileTextIcon className="h-4 w-4 text-blue-500" />}
                        <span className="text-sm font-medium">{submittedProof.name}</span>
                    </div>
                    <a 
                        href={submittedProof.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                    >
                        View <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                </div>
                {isImage && (
                    <div className="relative w-full h-48 mt-2">
                        <Image
                            src={submittedProof.url}
                            alt={submittedProof.name}
                            fill
                            className="object-contain rounded-md"
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderField = () => {
        switch (field.type) {
            case 'text_field':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || ""}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                type="text"
                                onChange={readOnly ? undefined : onChange}
                                value={value}
                                placeholder={field.placeholder}
                                className={errors[field.name] ? 'border-red-500' : ''}
                                disabled={readOnly}
                            />
                        )}
                    />
                );

            case 'textarea':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || ""}
                        render={({ field: { onChange, value } }) => (
                            <Textarea
                                rows={field.rows}
                                onChange={readOnly ? undefined : onChange}
                                value={value}
                                placeholder={field.placeholder}
                                className={errors[field.name] ? 'border-red-500' : ''}
                                disabled={readOnly}
                            />
                        )}
                    />
                );

            case 'number_field':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || ""}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                type="number"
                                onChange={readOnly ? undefined : (e) => {
                                    const val = field.validation.integer_only
                                        ? parseInt(e.target.value)
                                        : parseFloat(e.target.value);
                                    onChange(val);
                                }}
                                value={value}
                                min={field.validation.min}
                                max={field.validation.max}
                                placeholder={field.placeholder}
                                className={errors[field.name] ? 'border-red-500' : ''}
                                disabled={readOnly}
                            />
                        )}
                    />
                );

            case 'date_field':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || ""}
                        render={({ field: { onChange, value } }) => (
                            <div className="relative">
                                <Input
                                    type="date"
                                    onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
                                    value={value}
                                    min={field.validation.min_date ? dayjs(field.validation.min_date).format('YYYY-MM-DD') : undefined}
                                    max={field.validation.max_date ? dayjs(field.validation.max_date).format('YYYY-MM-DD') : undefined}
                                    className={errors[field.name] ? 'border-red-500' : ''}
                                    disabled={readOnly}
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                            </div>
                        )}
                    />
                );

            case 'checkbox':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || field.default || false}
                        render={({ field: { onChange, value } }) => (
                            <Checkbox
                                checked={value}
                                onCheckedChange={readOnly ? undefined : onChange}
                                className={errors[field.name] ? 'border-red-500' : ''}
                                disabled={readOnly}
                            />
                        )}
                    />
                );

            case 'single_select':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || field.default_value || ""}
                        render={({ field: { onChange, value } }) => (
                            <Select onValueChange={readOnly ? undefined : onChange} value={value} disabled={readOnly}>
                                <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                );

            case 'multi_select':
                return (
                    <Controller
                        name={field.name}
                        control={control}
                        defaultValue={submittedValue || field.default_values || []}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                onValueChange={readOnly ? undefined : (val) => onChange([...value, val])}
                                value={value[value.length - 1] || ""}
                                disabled={readOnly}
                            >
                                <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select options" />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <Label>
                        {field.label}
                        {!readOnly && field.validation.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.description && (
                        <p className="text-sm text-gray-500">{field.description}</p>
                    )}
                </div>
                {field.proof_required && !readOnly && (
                    <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            multiple={false}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="w-64 cursor-pointer text-sm"
                            {...register(`${field.name}_proof`, {
                                required: field.validation.required,
                                onChange: handleFileChange,
                            })}
                            disabled={readOnly}
                        />
                        {field.proof_description && (
                            <div className="group relative">
                                <InfoIcon className="h-4 w-4 text-blue-500 cursor-help" />
                                <div className="absolute right-0 w-48 p-2 bg-white rounded-md shadow-lg border text-xs invisible group-hover:visible">
                                    {field.proof_description}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div>
                {renderField()}
                {!readOnly && errors[field.name] && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors[field.name].message || field.validation.custom_error || "This field is required"}
                    </p>
                )}
                {field.proof_required && submittedProof && renderProofPreview()}
            </div>
        </div>
    );
}

export default function RenderFormClient({
    form,
    envelope
}: {
    form: (typeof complianceForms.$inferSelect),
    envelope: (typeof monitoredEnvelopes.$inferSelect)
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormField[]>([]);
    const isCompleted = !!form.filledByComplianceOfficerAt;
    const submittedData = form.submittedFormData;

    useEffect(() => {
        try {
            const fields = form.generatedSchema;
            setFormData(fields);
            setLoading(false);
        } catch (err) {
            setError('Failed to load form data');
            setLoading(false);
        }
    }, [form.generatedSchema]);


    const validatedForm = getValidationSchemaFromSchema(formData);

    const { control, handleSubmit, register, formState: { errors } } = useForm({
        resolver: zodResolver(validatedForm),
        defaultValues: submittedData || {}
    });

    const { toast } = useToast();

    useEffect(() => {
        // Show validation errors in toast if any
        if (!isCompleted && Object.keys(errors).length > 0) {
            const errorMessages = Object.entries(errors)
                .map(([field, error]) => `${field}: ${(error?.message as string) || 'Invalid field'}`)
                .join('\n');

            toast({
                title: "Validation Error",
                description: errorMessages,
                variant: "destructive",
            });
            return;
        }
    }, [errors]);

    const onSubmit = async (data: Record<string, any>) => {
        if (isCompleted) return;
        
        console.log('Raw form data:', data);
        const response = await handleFormSubmission(data, form.id);

        if (response.error) {
            toast({
                title: "Error",
                description: response.error,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Form submitted successfully!!",
                description: response.message,
                variant: "default",
            })
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-500">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Envelope Info Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileTextIcon className="h-5 w-5 text-blue-500" />
                                <div>
                                    <CardTitle>Envelope Information</CardTitle>
                                    <CardDescription>Details about the monitored envelope</CardDescription>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Due Date</div>
                                <div className="font-medium text-blue-600">{dayjs(form.dueDate).format('MMMM D, YYYY')}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div>
                            <Label className="text-sm text-gray-500">Compliance Officer</Label>
                            <p className="font-medium truncate">{envelope.complianceOfficerEmail}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-500">Donor Officer</Label>
                            <p className="font-medium truncate">{envelope.donorOfficerEmail}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-gray-500">Money Received</Label>
                            <p className="font-medium text-green-600">${envelope.moneyReceivedTillDate.toLocaleString()}</p>
                        </div>
                        {envelope.briefDescription && (
                            <div className="col-span-full">
                                <Label className="text-sm text-gray-500">Description</Label>
                                <p className="font-medium text-gray-700">{envelope.briefDescription}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Form Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <InfoIcon className="h-5 w-5 text-blue-500" />
                            <div>
                                <CardTitle>Compliance Form {isCompleted && "(Completed)"}</CardTitle>
                                <CardDescription>
                                    {isCompleted 
                                        ? `This form was completed on ${dayjs(form.filledByComplianceOfficerAt).format('MMMM D, YYYY')}`
                                        : "Please fill out all required fields marked with an asterisk (*)"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {formData.map((field: FormField) => (
                                <FormFieldComponent
                                    key={field.name}
                                    field={field}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    readOnly={isCompleted}
                                    submittedValue={submittedData?.[field.name]}
                                    submittedProof={submittedData?.[`${field.name}_proof`]}
                                />
                            ))}
                        </form>
                    </CardContent>
                    {!isCompleted && (
                        <CardFooter className="flex justify-end pt-4 border-t">
                            <Button type="submit" onClick={handleSubmit(onSubmit)} className="px-8">
                                Submit Form
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}

