LASTPATCH=$(find /app/trajectories/ -iname '*.patch' | grep Tecuya | sort | tail -n 1)
echo "Last patch is $LASTPATCH and Im gonna apply it"

cd /git
patch -p 1 < $LASTPATCH
cd /app
