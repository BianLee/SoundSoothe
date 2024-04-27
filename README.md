## Intel Developer Cloud

How to connect:
`scp -J guest@146.152.232.8 main2.py ubuntu@100.80.231.78:~/`

How to run:
`main2.py`

If you need to copy a file from your machine -> VM:
`scp -J guest@146.152.232.8 main2.py ubuntu@100.80.231.78:~/`

If you need to copy from VM -> machine:
`scp -J guest@146.152.232.8 ubuntu@100.80.231.78:/home/ubuntu/Code/musicGen-test-1/musicgen_out.wav .`
Intel uses some kind of jump host, which is why it's a little confusing looking.

## Google VM

`ssh -i ~/.ssh/google andrewkuang11@35.232.96.13`

Here's how I initialize the VMs:

1. Conda installation:

```
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
```

Then intialize the bash/zsh CLIs:

```
~/miniconda3/bin/conda init bash
~/miniconda3/bin/conda init zsh
```

Then you gotta exit and the reconnect:
`exit`

`ssh -i ~/.ssh/google andrewkuang11@35.232.96.13`

### Making a Conda Environment to run `streaming.py`

Create a Conda environment with PyTorch, Scipy, Flask

```
 conda create -n musicGen pytorch scipy
 conda activate musicGen
 conda install flask
```

Then install the HuggingFace Transformers pip package:

```
pip install --upgrade pip
pip install --upgrade transformers scipy
```
