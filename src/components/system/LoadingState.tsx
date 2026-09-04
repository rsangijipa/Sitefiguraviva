import {
  LoadingState as CoreLoadingState,
  type LoadingStateProps,
} from "@/components/core/feedback";

export function LoadingState(props: LoadingStateProps) {
  return <CoreLoadingState {...props} />;
}
