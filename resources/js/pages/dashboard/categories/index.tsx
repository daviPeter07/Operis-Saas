import { useState } from 'react';
import { PageContent } from '@/components/page-content';
import { ServerTable } from '@/components/table/server-table';
import { useDeleteCategory } from '@/hooks/use-categories';
import { useServerTableState } from '@/hooks/use-server-table-state';
import { useUrlAction } from '@/hooks/use-url-action';
import AppLayout from '@/layouts/app-layout';
import type { Category } from '@/schemas/category';
import { CreateEditModal } from './components/create-edit-modal';
import {
    CATEGORIES_BREADCRUMB,
    CATEGORIES_FILTER_KEYS,
    CATEGORIES_TITLE,
    CATEGORY_COLUMNS,
    CATEGORY_EXPORT_COLUMNS,
    CREATE_CATEGORY_ACTION,
} from './utils/constants';
import {
    fetchAllCategories,
    toCategoryRow,
    useCategoriesPage,
} from './utils/functions';

export default function CategoriesPage() {
    const tableState = useServerTableState({
        filterKeys: CATEGORIES_FILTER_KEYS,
    });
    const categoriesPage = useCategoriesPage(tableState.apiParams);
    const deleteCategory = useDeleteCategory();
    const [isCreateOpen, setIsCreateOpen] = useUrlAction(
        CREATE_CATEGORY_ACTION,
    );
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );

    return (
        <AppLayout breadcrumbs={[CATEGORIES_BREADCRUMB]}>
            <PageContent>
                <ServerTable
                    title={CATEGORIES_TITLE}
                    columns={CATEGORY_COLUMNS}
                    exportColumns={CATEGORY_EXPORT_COLUMNS}
                    rows={(categoriesPage.data?.data ?? []).map(toCategoryRow)}
                    total={categoriesPage.data?.meta.total ?? 0}
                    lastPage={categoriesPage.data?.meta.last_page ?? 1}
                    isLoading={categoriesPage.isPending}
                    isFetching={categoriesPage.isFetching}
                    state={tableState}
                    onCreate={() => setIsCreateOpen(true)}
                    onEdit={(row) => setEditingCategory(row.category)}
                    onDelete={async (row) => {
                        await deleteCategory.mutateAsync(row.category.id);
                    }}
                    itemName={(row) => row.name}
                    loadAllForExport={async () =>
                        (await fetchAllCategories(tableState.apiParams)).map(
                            toCategoryRow,
                        )
                    }
                />

                <CreateEditModal
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />

                {editingCategory ? (
                    <CreateEditModal
                        open
                        onOpenChange={(open) =>
                            !open && setEditingCategory(null)
                        }
                        category={editingCategory}
                    />
                ) : null}
            </PageContent>
        </AppLayout>
    );
}
