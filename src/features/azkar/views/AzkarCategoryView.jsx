import { useCallback, useMemo } from 'react'
import { useBlocker, useParams } from 'react-router-dom'
import { IconDoorExit, IconArrowBackUp, IconRestore } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import BackButton from '@/shared/ui/BackButton'
import AsyncContent from '@/shared/ui/AsyncContent'
import BottomSheet from '@/shared/ui/BottomSheet'
import ZekrCard from '@/features/azkar/components/ZekrCard'
import { fetchCategory } from '@/features/azkar/api'
import { useAzkarProgress } from '@/features/azkar/hooks/useAzkarProgress'
import { useAppStore } from '@/app/stores/app'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { ROUTES } from '@/app/router/routes'

export default function AzkarCategoryView() {
  const { category: slug } = useParams()

  const saveProgress = useAppStore((state) => state.zekrSaveProgress)
  const confirmOnLeave = useAppStore((state) => state.zekrConfirmOnLeave)

  const { counts, setCount, reset: resetProgress } = useAzkarProgress(slug, saveProgress)

  const fetcher = useCallback(() => fetchCategory(slug), [slug])
  const { data: category, error, pending: isFetching } = useAsyncData(fetcher, { deps: [slug] })

  usePageMeta(
    category && {
      title: category.meta.name,
      description: category.meta.description,
      keywords: ['أذكار', 'دعاء', category.meta.name, 'رفيق'],
    },
  )

  // Track progress across all azkar, derived from the persisted per-zekr counts.
  const azkar = useMemo(() => category?.content ?? [], [category])
  const totalRepeats = useMemo(() => azkar.reduce((sum, zekr) => sum + (zekr.repeat || 1), 0), [azkar])
  const totalClicked = useMemo(() => azkar.reduce((sum, _, index) => sum + (counts[index] || 0), 0), [azkar, counts])

  const progress = totalRepeats > 0 ? (totalClicked / totalRepeats) * 100 : 0
  const hasUnfinishedProgress = progress > 0 && progress < 100

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        confirmOnLeave && hasUnfinishedProgress && currentLocation.pathname !== nextLocation.pathname,
      [confirmOnLeave, hasUnfinishedProgress],
    ),
  )

  return (
    <>
      <AsyncContent pending={isFetching} error={error} loadingMessage="جاري تحميل الأذكار...">
        {category && (
          <Page>
            <Heading className="mb-4" title={category.meta.name} subtitle={category.meta.description} share />

            {azkar.map((zekr, index) => (
              <ZekrCard
                key={index}
                className="mb-3"
                count={counts[index] ?? 0}
                onCountChange={(count) => setCount(index, count)}
                text={zekr.text}
                repeat={zekr.repeat}
                reference={zekr.reference}
                benefit={zekr.benefit}
              />
            ))}

            <div className="d-flex justify-content-center gap-2">
              {totalClicked > 0 && (
                <button
                  type="button"
                  className="btn btn-flat d-inline-flex align-items-center gap-2"
                  onClick={resetProgress}
                >
                  <IconRestore size="1.25rem" />
                  <span>تصفير</span>
                </button>
              )}

              <BackButton to={ROUTES.azkar} buttonClass="btn-primary" />
            </div>
          </Page>
        )}
      </AsyncContent>

      {/* Leave confirmation sheet */}
      <BottomSheet show={blocker.state === 'blocked'} title="لم تنتهِ بعد" onClose={() => blocker.reset?.()}>
        <p className="px-4 pt-3 mb-2 lh-lg text-secondary">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
        <ul className="list-unstyled m-0 py-2">
          <li>
            <button className="bottom-sheet-item" onClick={() => blocker.reset?.()}>
              <IconArrowBackUp size="20" />
              <span>البقاء ومتابعة الأذكار</span>
            </button>
          </li>
          <li>
            <button className="bottom-sheet-item text-danger" onClick={() => blocker.proceed?.()}>
              <IconDoorExit size="20" />
              <span>مغادرة</span>
            </button>
          </li>
        </ul>
      </BottomSheet>
    </>
  )
}
