bin=`cd "$bin"; pwd`
CURRENT_DIR=`cd $bin; pwd`

cd $CURRENT_DIR/client && pnpm run dev &

cd $CURRENT_DIR/server && go run . serve --dev &

wait