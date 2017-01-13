package main

import (
	"errors"
	"fmt"
	"net"
	"os"
	"time"

	"golang.org/x/net/context"

	"google.golang.org/grpc"
)

func main() {
	svc := &Svc{}

	lis, err := net.Listen("tcp", "localhost:6565")
	if err != nil {
		fmt.Println("Unexpected err:", err)
		os.Exit(1)
	}

	srv := grpc.NewServer()

	RegisterExampleServiceServer(srv, svc)

	fmt.Println("Serving example grpc service:", lis.Addr().String())
	srv.Serve(lis)

}

type Svc struct {
}

//SayHello says the requested phrase
func (svc *Svc) SayHello(ctx context.Context, req *SayRequest) (*SayReply, error) {

	if req.SayWhat == "" {
		return nil, errors.New("Must request server to say something!")
	}

	if req.Recipient != nil {
		for i := 0; i < int(req.Recipient.NumberOfTimes); i++ {
			fmt.Printf("%s to %s - %d\n", req.SayWhat, req.Recipient.Name, i)
		}

		return &SayReply{
			SaidWhat: fmt.Sprintf("Server says, \"%s\" to %s, %d times at %s", req.SayWhat, req.Recipient.Name, req.Recipient.NumberOfTimes, time.Now().Format("3:04:05PM")),
		}, nil
	}

	fmt.Printf("%s to World\n", req.SayWhat)

	return &SayReply{
		SaidWhat: fmt.Sprintf("Server says, \"%s\" to World at %s", req.SayWhat, time.Now().Format("3:04:05PM")),
	}, nil
}

func (svc *Svc) SayHelloStream(srv ExampleService_SayHelloStreamServer) error {
	ctx := srv.Context()

	for {
		req, err := srv.Recv()
		if err != nil {
			return err
		}

		resp, err := svc.SayHello(ctx, req)
		if err != nil {
			return err
		}

		err = srv.Send(resp)
		if err != nil {
			return err
		}
	}

}

//go:generate protoc -I=./ -I=$GOPATH/src --go_out=plugins=grpc:. example.proto
