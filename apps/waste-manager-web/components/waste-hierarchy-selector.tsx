"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWasteTypes, useWasteCategories } from "@/hooks/use-market-prices"

interface WasteHierarchySelectorProps {
  selectedTypeId?: number
  selectedCategoryId?: number
  onTypeChange: (typeId: number | undefined) => void
  onCategoryChange: (categoryId: number | undefined) => void
  disabled?: boolean
  required?: boolean
}

export function WasteHierarchySelector({
  selectedTypeId,
  selectedCategoryId,
  onTypeChange,
  onCategoryChange,
  disabled = false,
  required = false
}: WasteHierarchySelectorProps) {
  const { wasteTypes, isLoading: typesLoading } = useWasteTypes()
  const { wasteCategories, isLoading: categoriesLoading } = useWasteCategories(selectedTypeId)

  // Limpiar categoría cuando cambia el tipo
  useEffect(() => {
    if (selectedTypeId && selectedCategoryId) {
      // Verificar si la categoría seleccionada pertenece al nuevo tipo
      const categoryBelongsToType = wasteCategories.some(
        cat => cat.id === selectedCategoryId && cat.wasteTypeId === selectedTypeId
      )
      if (!categoryBelongsToType) {
        onCategoryChange(undefined)
      }
    }
  }, [selectedTypeId, wasteCategories, selectedCategoryId, onCategoryChange])

  const handleTypeChange = (value: string) => {
    const typeId = value === "none" ? undefined : parseInt(value)
    onTypeChange(typeId)
    // Limpiar categoría cuando cambia el tipo
    onCategoryChange(undefined)
  }

  const handleCategoryChange = (value: string) => {
    const categoryId = value === "none" ? undefined : parseInt(value)
    onCategoryChange(categoryId)
  }

  const selectedType = wasteTypes.find(type => type.id === selectedTypeId)
  const availableCategories = selectedTypeId ? wasteCategories : []

  return (
    <div className="space-y-4">
      {/* Selector de Tipo de Residuo */}
      <div className="space-y-2">
        <Label htmlFor="waste-type" className="text-sm font-medium">
          Tipo de Residuo {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={selectedTypeId?.toString() || "none"}
          onValueChange={handleTypeChange}
          disabled={disabled || typesLoading}
          required={required}
        >
          <SelectTrigger id="waste-type">
            <SelectValue placeholder={typesLoading ? "Cargando tipos..." : "Selecciona un tipo de residuo"} />
          </SelectTrigger>
          <SelectContent>
            {!required && (
              <SelectItem value="none">
                <span className="text-muted-foreground">Sin tipo específico</span>
              </SelectItem>
            )}
            {wasteTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                <div className="flex items-center gap-2">
                  {type.color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                  )}
                  <span>{type.name}</span>
                  <span className="text-xs text-muted-foreground">({type.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedType?.description && (
          <p className="text-xs text-muted-foreground">{selectedType.description}</p>
        )}
      </div>

      {/* Selector de Categoría */}
      <div className="space-y-2">
        <Label htmlFor="waste-category" className="text-sm font-medium">
          Categoría {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={selectedCategoryId?.toString() || "none"}
          onValueChange={handleCategoryChange}
          disabled={disabled || categoriesLoading || !selectedTypeId}
          required={required}
        >
          <SelectTrigger id="waste-category">
            <SelectValue 
              placeholder={
                !selectedTypeId 
                  ? "Primero selecciona un tipo" 
                  : categoriesLoading 
                    ? "Cargando categorías..." 
                    : "Selecciona una categoría"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {!required && selectedTypeId && (
              <SelectItem value="none">
                <span className="text-muted-foreground">Sin categoría específica</span>
              </SelectItem>
            )}
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    <span className="text-xs text-muted-foreground">({category.code})</span>
                  </div>
                  {category.description && (
                    <span className="text-xs text-muted-foreground">{category.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Mostrar specs técnicas si existen */}
        {selectedCategoryId && (() => {
          const selectedCategory = availableCategories.find(cat => cat.id === selectedCategoryId)
          return selectedCategory?.technicalSpecs && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              <strong>Especificaciones:</strong>
              <div className="mt-1">
                {Object.entries(selectedCategory.technicalSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
